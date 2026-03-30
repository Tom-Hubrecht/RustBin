// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

function filterProps<T extends Object>(obj: T, props: (keyof T)[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(([name]) => props.includes(name as keyof T)),
  );
}

function removeProps<T extends Object>(obj: T, props: (keyof T)[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(([name]) => !props.includes(name as keyof T)),
  );
}
