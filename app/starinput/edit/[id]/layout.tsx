export default function EditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

// Optional: Add metadata
export const metadata = {
  title: 'Edit Experience | THRIVE Toolkit',
  description: 'Edit your STAR experience',
} 