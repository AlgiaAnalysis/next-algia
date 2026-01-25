import { requireAuth } from '@/lib/auth'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verifica se o usuario esta autenticado e e paciente
  await requireAuth(['patient'])

  return <>{children}</>
}
