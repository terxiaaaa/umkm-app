// Importers: ProductList, TransactionList, etc. Centered empty-state placeholder with icon, text, optional action.
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon size={48} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
