export function GapSentence({
  sentence,
  fill,
}: {
  sentence: string;
  fill?: string;
}) {
  if (fill === "") {
    const collapsed = sentence.replace(/\s*___\s*/g, " ").replace(/\s+/g, " ").trim();
    return <p className="font-serif text-2xl leading-snug text-balance sm:text-3xl">{collapsed}</p>;
  }

  if (!sentence.includes("___")) {
    return <p className="font-serif text-2xl leading-snug text-balance sm:text-3xl">{sentence}</p>;
  }

  const parts = sentence.split("___");
  return (
    <p className="font-serif text-2xl leading-snug text-balance sm:text-3xl">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 &&
            (fill ? (
              <span className="text-primary">{fill}</span>
            ) : (
              <span
                className="mx-1 inline-block min-w-16 border-b-2 border-primary/45 align-baseline"
                aria-hidden="true"
              >
                &nbsp;
              </span>
            ))}
        </span>
      ))}
    </p>
  );
}
