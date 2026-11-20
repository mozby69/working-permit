export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    UNAUTHORIZED: "/unauthorized",

    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        ACCESS_CONTROL: "/admin/access-control",
    },
    USER:{
        WORKING_PERMIT: "/workingPermit",
        ONGOING_PERMIT: "/onGoingPermit"
    },
     BRANCH:{
        WORKING_PERMIT: "/branch",
    }
} as const;


