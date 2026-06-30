const Spinner = ({
  size = 'md',
  color = 'primary',
}: {
  size?: 'sm' | 'md' | 'lg' | 'responsive'
  color?: 'primary' | 'secondary' | 'primary-foreground'
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${size === 'sm' && 'h-5 w-5'} ${size === 'md' && 'h-8 w-8'} ${size === 'lg' && 'h-10 w-10'} ${size === 'responsive' && 'h-8 w-8 md:h-10 md:w-10'} `}
    >
      <div
        className={`border-primary absolute h-full w-full animate-[spin_0.8s_ease_infinite] rounded-full border-solid border-t-transparent border-r-transparent border-l-transparent ${size === 'sm' ? 'border-2' : 'border-[3px]'} ${color === 'secondary' && 'border-b-white'} ${color === 'primary-foreground' && 'border-b-primary-foreground'} `}
      />
      <div
        className={`border-primary absolute h-full w-full animate-[spin_0.8s_linear_infinite] rounded-full border-dotted border-t-transparent border-r-transparent border-l-transparent opacity-75 ${size === 'sm' ? 'border-2' : 'border-[3px]'} ${color === 'secondary' && 'border-b-white'} ${color === 'primary-foreground' && 'border-b-primary-foreground'} `}
      />
    </div>
  )
}

export default Spinner
