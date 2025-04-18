import { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="root-layout">
      <nav>
        {children}
      </nav>
    </div>
  );
};

export default RootLayout;