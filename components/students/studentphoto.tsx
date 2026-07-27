type StudentPhotoProps = {
  photoUrl?: string;
};

export default function StudentPhoto({
  photoUrl,
}: StudentPhotoProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border bg-gray-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Student"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-500">No Photo</span>
        )}
      </div>
    </div>
  );
}