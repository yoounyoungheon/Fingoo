import { ReactNode } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';

type ChatCardProps = {
  defaultOpen: boolean;
  children: ReactNode;
};

export const ChatCardRoot = ({ defaultOpen, children }: ChatCardProps) => {
  return <Collapsible.Root defaultOpen={defaultOpen}>{children}</Collapsible.Root>;
};