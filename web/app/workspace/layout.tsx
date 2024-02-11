import MetadataDialogMenu from '../ui/components/numerical-guidance/metadata-dialog-menu';
import { DialogRoot } from '../ui/components/view/molocule/dialog/dialog-root';
import SideNav from '../ui/pages/workspace/sidenav';
import { DIALOG_KEY } from '../utils/keys/dialog-menu-key';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-96">
        <SideNav />
      </div>
      <div className="w-full">{children}</div>
      <MetadataDialogMenu />
      <DialogRoot dialogKey={DIALOG_KEY.METADATA_DELETE} />
    </div>
  );
}
