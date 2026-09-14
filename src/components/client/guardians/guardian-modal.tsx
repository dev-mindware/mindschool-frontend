'use client';

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
import { useSchoolDataStore } from '@/stores/school/school-data-store';
import { GlobalModal, Button, ButtonSubmit } from '@/components';
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

const RELATIONSHIP_LABELS: Record<string, string> = {
  FATHER: 'Pai',
  MOTHER: 'Mãe',
  UNCLE: 'Tio(a)',
  GRANDPARENT: 'Avô/Avó',
  LEGAL_GUARDIAN: 'Tutor(a) Legal',
  TUTOR: 'Encarregado Indicado',
  OTHER: 'Outro',
};

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
  const { addGuardian, updateGuardian, students } = useSchoolDataStore();

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
      if (guardianToEdit) {
        updateGuardian(guardianToEdit.id, {
          fullName: data.fullName,
          idDocumentNumber: data.idDocumentNumber || undefined,
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          profession: data.profession || undefined,
          workplace: data.workplace || undefined,
          preferredContactChannel: data.preferredContactChannel,
          wards,
        });
        SucessMessage('Dados do encarregado atualizados com sucesso!');
      } else {
        addGuardian({
          schoolId: 'dev-school-1',
          fullName: data.fullName,
          idDocumentType: 'BI',
          idDocumentNumber: data.idDocumentNumber || undefined,
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          profession: data.profession || undefined,
          workplace: data.workplace || undefined,
          preferredContactChannel: data.preferredContactChannel,
          wards,
        });
        SucessMessage('Novo encarregado cadastrado com sucesso!');
      }

      onClose();
    } catch (err: any) {
      ErrorMessage(err?.message || 'Ocorreu um erro ao guardar o encarregado.');
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={guardianToEdit ? 'Editar Encarregado de Educação' : 'Registar Encarregado de Educação'}
      description="Gerencie os dados cadastrais, contactos e a lista de todos os educandos a cargo"
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
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

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            {guardianToEdit ? 'Guardar Alterações' : 'Cadastrar Encarregado'}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
