import RoleGuard from "@/components/guards/RoleGuard";
import WorkingPermitView from "@/modules/workingPermit/views/workingPermitView";

export default function AccessControlPage() {
    return (
        <RoleGuard roles={["COORDINATOR","CHECKER"]}>
            <WorkingPermitView />
        </RoleGuard>
    );
}