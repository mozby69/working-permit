import RoleGuard from "@/components/guards/RoleGuard";
import OnGoingPermitView from "@/modules/onGoingPermit/views/onGoingPermitView";


export default function AccessControlPage() {
    return (
        <RoleGuard roles={["COORDINATOR","CHECKER","FIRST_APPROVER","FINAL_APPROVER","TROUBLESHOOTER"]}>
            <OnGoingPermitView />
        </RoleGuard>
    );
}