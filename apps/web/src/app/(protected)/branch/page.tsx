import RoleGuard from "@/components/guards/RoleGuard";
import BranchWorkingView from "@/modules/branch/views/BranchWorkingView";

export default function AccessControlPage() {
    return (
        <RoleGuard roles={["BRANCH", "COORDINATOR"]}>
            <BranchWorkingView />
        </RoleGuard>
    );
}