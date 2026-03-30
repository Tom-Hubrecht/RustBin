// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

export const select = (node: HTMLElement): void => {
  const s = document.getSelection();

  if (!s) return;

  const range = document.createRange();
  range.selectNodeContents(node);

  s.removeAllRanges();
  s.addRange(range);
};
