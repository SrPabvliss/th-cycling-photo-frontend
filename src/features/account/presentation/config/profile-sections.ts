import ProfileForm from '@/features/account/presentation/components/ProfileForm/ProfileForm.vue'
import PhoneList from '@/features/account/presentation/components/PhoneList/PhoneList.vue'
import EmailSection from '@/features/account/presentation/components/EmailSection/EmailSection.vue'
import PasswordForm from '@/features/account/presentation/components/PasswordForm/PasswordForm.vue'
import type {
  ProfileBlockIconName,
  ProfileSectionDef,
} from '../../types/profile-section.types'

export type { ProfileSectionDef, ProfileBlockIconName }

export const ACCOUNT_SECTIONS: ProfileSectionDef[] = [
  {
    key: 'personal-info',
    label: 'Datos personales',
    icon: 'user',
    subtitle: 'Nombre, ubicación y fecha de nacimiento.',
    group: 'account',
    component: ProfileForm,
  },
  {
    key: 'phones',
    label: 'Teléfonos',
    icon: 'phone',
    subtitle: 'Para que TitanTV te contacte si hay algo con tu pedido.',
    group: 'account',
    component: PhoneList,
  },
  { key: 'email', label: 'Correo', icon: 'mail', group: 'account', component: EmailSection },
  { key: 'password', label: 'Contraseña', icon: 'lock', group: 'account', component: PasswordForm },
]
