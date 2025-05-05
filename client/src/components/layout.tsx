import { useState } from "react";
import Navbar from "./navbar";
import RoleSelector from "./role-selector";
import { UserRole } from "@/App";

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Layout({ children, userRole, onRoleChange }: LayoutProps) {
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);

  const handleRoleToggle = () => {
    setIsRoleSelectorOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onRoleToggle={handleRoleToggle} userRole={userRole} />
      
      <RoleSelector
        open={isRoleSelectorOpen}
        onOpenChange={setIsRoleSelectorOpen}
        onRoleSelect={onRoleChange}
      />
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">&copy; 2023 StartupSim. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
