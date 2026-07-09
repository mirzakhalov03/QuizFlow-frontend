import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export type SelectOption = {
  label: string
  value: string
  disabled?: boolean
  customRender?: () => React.ReactNode
  /** Optional section label. When any option has a group, the dropdown renders
   *  grouped sections separated by a divider. */
  group?: string
}

type CustomSelectProps = {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  const hasGroups = options.some((opt) => opt.group)
  const groupOrder: string[] = []
  const grouped: Record<string, SelectOption[]> = {}
  if (hasGroups) {
    for (const opt of options) {
      const group = opt.group ?? ''
      if (!(group in grouped)) {
        grouped[group] = []
        groupOrder.push(group)
      }
      grouped[group].push(opt)
    }
  }

  const renderOption = (option: SelectOption) => (
    <div
      key={option.value}
      onClick={() => !option.disabled && handleSelect(option.value)}
      className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-150 ${
        option.disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${
        option.value === value
          ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
      } `}
    >
      {option.customRender ? option.customRender() : option.label}
    </div>
  )

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`bg-card text-card-foreground border-border hover:border-ring/50 focus:ring-ring focus:ring-offset-background flex w-full h-10 cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-left shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption?.customRender
            ? selectedOption.customRender()
            : selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} `}
        />
      </button>

      {isOpen && (
        <div className="bg-popover text-popover-foreground border-border absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-lg">
          {options.length === 0 ? (
            <div className="text-muted-foreground px-3 py-2 text-sm">No options available</div>
          ) : hasGroups ? (
            groupOrder.map((group, index) => (
              <div key={group || index}>
                {group ? (
                  <div
                    className={`text-muted-foreground px-3 pt-2 pb-1 text-xs font-medium tracking-wide uppercase ${
                      index > 0 ? 'border-border mt-1 border-t' : ''
                    }`}
                  >
                    {group}
                  </div>
                ) : (
                  index > 0 && <div className="border-border my-1 border-t" />
                )}
                {grouped[group].map(renderOption)}
              </div>
            ))
          ) : (
            options.map(renderOption)
          )}
        </div>
      )}
    </div>
  )
}
