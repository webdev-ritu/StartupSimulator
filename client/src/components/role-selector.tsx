import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserRole } from "@/App";

interface RoleSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelector({
  open,
  onOpenChange,
  onRoleSelect,
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">Choose Your Role</DialogTitle>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div
            className={cn(
              "role-card border border-primary-200 rounded-lg p-5 cursor-pointer hover:bg-primary-50 hover:border-primary-500 flex flex-col items-center",
              selectedRole === "founder" && "bg-primary-50 border-primary-500"
            )}
            onClick={() => handleRoleSelect("founder")}
          >
            <div className="text-3xl text-primary-500 mb-2">
              <i className="fas fa-rocket"></i>
            </div>
            <h4 className="font-medium">Founder</h4>
            <p className="text-xs text-gray-500 mt-2 text-center">Create startup, pitch to investors</p>
          </div>
          <div
            className={cn(
              "role-card border border-accent-200 rounded-lg p-5 cursor-pointer hover:bg-accent-50 hover:border-accent-500 flex flex-col items-center",
              selectedRole === "investor" && "bg-accent-50 border-accent-500"
            )}
            onClick={() => handleRoleSelect("investor")}
          >
            <div className="text-3xl text-accent-500 mb-2">
              <i className="fas fa-chart-line"></i>
            </div>
            <h4 className="font-medium">Investor</h4>
            <p className="text-xs text-gray-500 mt-2 text-center">Review pitches, invest in startups</p>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRole}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
