type MetadataResultProps = {
  metadata : any
}
export default function ({metadata}: MetadataResultProps) {
  return (
    <div>
      <h3>Extracted Metadata:</h3>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
}
