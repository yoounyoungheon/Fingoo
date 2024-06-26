import SplitScreenToggleGroup from '../../ui/pages/workspace/split-screen/split-screen-toggle-group';
import Workspace from '../../ui/pages/workspace/workspace';

export default function Page() {
  return (
    <>
      <div className="fixed left-1/2 -translate-x-1/2 rounded-lg bg-white">
        <SplitScreenToggleGroup />
      </div>
      <div className="flex h-full items-center justify-center">
        <Workspace />
      </div>
    </>
  );
}
