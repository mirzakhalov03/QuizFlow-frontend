import { CustomSelect } from '@/components/ui/select'
import type { FolderStat } from '@/types/analytics'

type Props = {
  folders: FolderStat[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function FolderSelector({ folders, selectedIndex, onSelect }: Props) {
  const options = folders.map((f, i) => ({
    label: `${f.folderName} (${f.attemptCount} quizzes)`,
    value: String(i),
  }))

  return (
    <CustomSelect
      options={options}
      value={String(selectedIndex)}
      onChange={(v) => onSelect(Number(v))}
      className="max-w-xs"
    />
  )
}
