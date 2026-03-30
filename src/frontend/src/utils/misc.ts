// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

const units = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB"];

export const size = (bytes: number) => {
  const range = Math.trunc(Math.log2(Math.abs(bytes)) / 10);

  if (range === 0 || bytes === 0)
    return { value: `${Math.abs(bytes)}`, unit: "B" };

  return {
    value: (Math.abs(bytes) / Math.pow(1024, range)).toFixed(2),
    unit: units[range - 1],
  };
};

export const pluralize = (count: number, word: string, suffix: string = "s") =>
  word.concat(...(count != 1 ? [suffix] : []));

export const toBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};
