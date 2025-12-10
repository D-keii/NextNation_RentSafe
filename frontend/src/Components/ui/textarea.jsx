export function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      {...props}
    />
  );
}

export default Textarea;

