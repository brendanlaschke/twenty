export const parseFileName = (
  fileName: string,
): { name: string; extension: string } => {
  if (!fileName.includes('.')) {
    return {
      name: fileName,
      extension: '',
    };
  }

  const fileExtension = fileName.split('.').at(-1);
  const name = fileName.split('.').shift();
  return {
    name: name ?? '',
    extension: fileExtension ?? '',
  };
};
