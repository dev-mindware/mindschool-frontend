'use client';

import { RELATIONSHIP_LABELS } from "@/constants/labels";
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Guardian,
  PreferredContactChannel,
  GuardianRelationship,
  GuardianWard,
} from '@/types';
import { useGuardians } from '@/hooks/school/use-guardians';
import { useStudents } from '@/hooks/school/use-students';
import { getApiErrorMessage } from '@/utils/api-error';
import { Button, ButtonSubmit } from '@/components';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { GuardianPersonalInfoFields } from './guardian-personal-info-fields';
import { GuardianContactsFields } from './guardian-contacts-fields';
import { GuardianWardsSection } from './guardian-wards-section';

const guardianFormSchema = z.object({
  fullName: z.string().trim().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  idDocumentNumber: z.string().trim().optional().or(z.literal('')),
  phonePrimary: z.string().trim().min(9, 'Contacto deve ter pelo menos 9 dígitos'),
  phoneSecondary: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Email inválido').or(z.literal('')).optional(),
  address: z.string().trim().optional().or(z.literal('')),
  profession: z.string().trim().optional().or(z.literal('')),
  workplace: z.string().trim().optional().or(z.literal('')),
  preferredContactChannel: z.enum(['WHATSAPP', 'SMS', 'EMAIL', 'PHONE_CALL']),
});

type GuardianFormValues = z.infer<typeof guardianFormSchema>;

interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardianToEdit?: Guardian | null;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'FATHER', label: 'Pai' },
  { value: 'MOTHER', label: 'Mãe' },
  { value: 'UNCLE', label: 'Tio(a)' },
  { value: 'GRANDPARENT', label: 'Avô/Avó' },
  { value: 'LEGAL_GUARDIAN', label: 'Tutor(a) Legal' },
  { value: 'TUTOR', label: 'Encarregado Indicado' },
  { value: 'OTHER', label: 'Outro' },
];


const CHANNEL_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp (Preferencial em Angola)' },
  { value: 'SMS', label: 'Mensagem SMS' },
  { value: 'EMAIL', label: 'Correio Electrónico (E-mail)' },
  { value: 'PHONE_CALL', label: 'Chamada Telefónica de Voz' },
];

export function GuardianModal({
  isOpen,
  onClose,
  guardianToEdit,
}: GuardianModalProps) {
  const { createGuardian, updateGuardian } = useGuardians();
  const { allStudents: students } = useStudents();

  const [wards, setWards] = useState<GuardianWard[]>([]);
  const [candidateStudentId, setCandidateStudentId] = useState<string>('');
  const [candidateRelationship, setCandidateRelationship] = useState<string>('FATHER');

  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 5;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      idDocumentNumber: '',
      phonePrimary: '',
      phoneSecondary: '',
      email: '',
      address: 'Luanda',
      profession: '',
      workplace: '',
      preferredContactChannel: 'WHATSAPP',
    },
  });

  const selectedChannel = watch('preferredContactChannel');

  useEffect(() => {
    if (guardianToEdit) {
      reset({
        fullName: guardianToEdit.fullName,
        idDocumentNumber: guardianToEdit.idDocumentNumber || '',
        phonePrimary: guardianToEdit.phonePrimary,
        phoneSecondary: guardianToEdit.phoneSecondary || '',
        email: guardianToEdit.email || '',
        address: guardianToEdit.address || '',
        profession: guardianToEdit.profession || '',
        workplace: guardianToEdit.workplace || '',
        preferredContactChannel: guardianToEdit.preferredContactChannel,
      });
      setWards(guardianToEdit.wards ? [...guardianToEdit.wards] : []);
    } else {
      reset({
        fullName: '',
        idDocumentNumber: '',
        phonePrimary: '',
        phoneSecondary: '',
        email: '',
        address: 'Luanda',
        profession: '',
        workplace: '',
        preferredContactChannel: 'WHATSAPP',
      });
      setWards([]);
    }
    setCandidateStudentId('');
    setCandidateRelationship('FATHER');
    setStudentSearch('');
    setStudentPage(1);
  }, [guardianToEdit, isOpen, reset]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  const pagedStudents = useMemo(() => {
    const start = (studentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, studentPage]);

  const studentOptions = useMemo(() => {
    const opts = pagedStudents.map((s) => ({
      value: s.id,
      label: s.fullName,
      description: `${s.studentNumber} • ${s.currentClassLevel || 'Sem Turma'}`,
    }));

    if (candidateStudentId && !opts.some((o) => o.value === candidateStudentId)) {
      const activeStudent = students.find((s) => s.id === candidateStudentId);
      if (activeStudent) {
        opts.unshift({
          value: activeStudent.id,
          label: activeStudent.fullName,
          description: `${activeStudent.studentNumber} • ${
            activeStudent.currentClassLevel || 'Sem Turma'
          }`,
        });
      }
    }

    return opts;
  }, [pagedStudents, candidateStudentId, students]);

  const handleStudentSearch = (val: string) => {
    setStudentSearch(val);
    setStudentPage(1);
  };

  const handleAddWard = () => {
    if (!candidateStudentId) return;

    const studentToAdd = students.find((s) => s.id === candidateStudentId);
    if (!studentToAdd) return;

    if (wards.some((w) => w.studentId === candidateStudentId)) {
      ErrorMessage('Este aluno já se encontra vinculado a este encarregado.');
      return;
    }

    const newWard: GuardianWard = {
      studentId: studentToAdd.id,
      studentName: studentToAdd.fullName,
      relationship: candidateRelationship as GuardianRelationship,
      isPrimaryContact: wards.length === 0,
    };

    setWards((prev) => [...prev, newWard]);
    setCandidateStudentId('');
    SucessMessage(`Aluno ${studentToAdd.fullName} adicionado aos educandos.`);
  };

  const handleRemoveWard = (studentId: string) => {
    setWards((prev) => prev.filter((w) => w.studentId !== studentId));
  };

  const onSubmit = async (data: GuardianFormValues) => {
    try {
      if (!data.idDocumentNumber) {
        ErrorMessage('O número do documento é obrigatório (identifica o encarregado).');
        return;
      }
      const input = {
        fullName: data.fullName,
        documentNumber: data.idDocumentNumber,
        phone: data.phonePrimary,
        email: data.email || undefined,
        wards: wards.map((w) => ({ studentId: w.studentId, relationship: w.relationship, isPrimaryContact: w.isPrimaryContact })),
      };
      if (guardianToEdit) {
        await updateGuardian.mutateAsync({ id: guardianToEdit.id, input, previousWardIds: guardianToEdit.wards.map((w) => w.studentId) });
        SucessMessage('Dados do encarregado atualizados com sucesso!');
      } else {
        await createGuardian.mutateAsync(input);
        SucessMessage('Novo encarregado cadastrado com sucesso!');
      }
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, 'Ocorreu um erro ao guardar o encarregado.'));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-lg font-bold">
            {guardianToEdit ? 'Editar Encarregado de Educação' : 'Registar Encarregado de Educação'}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Gerencie os dados cadastrais, contactos e a lista de todos os educandos a cargo
          </SheetDescription>
        </SheetHeader>

      <form id="guardian-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
        <GuardianPersonalInfoFields register={register} errors={errors} />

        <GuardianContactsFields
          register={register}
          errors={errors}
          selectedChannel={selectedChannel}
          channelOptions={CHANNEL_OPTIONS}
          onChannelChange={(val) => setValue('preferredContactChannel', val)}
        />

        <GuardianWardsSection
          wards={wards}
          candidateStudentId={candidateStudentId}
          candidateRelationship={candidateRelationship}
          relationshipOptions={RELATIONSHIP_OPTIONS}
          relationshipLabels={RELATIONSHIP_LABELS}
          studentSearch={studentSearch}
          studentPage={studentPage}
          totalPages={totalPages}
          studentOptions={studentOptions}
          onSelectCandidateStudent={setCandidateStudentId}
          onChangeCandidateRelationship={setCandidateRelationship}
          onSearchStudents={handleStudentSearch}
          onPageChange={setStudentPage}
          onAddWard={handleAddWard}
          onRemoveWard={handleRemoveWard}
        />

      </form>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit form="guardian-form" isLoading={isSubmitting}>
            {guardianToEdit ? 'Guardar Alterações' : 'Cadastrar Encarregado'}
          </ButtonSubmit>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
