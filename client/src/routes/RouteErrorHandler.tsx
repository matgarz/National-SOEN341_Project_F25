import { useEffect } from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { clearTokens } from "../auth/tokenAuth";

interface RouteError {
    status?: number;
    message?: string;
    error?: string;
}

export default function ErrorHandler() {
    const error = useRouteError() as RouteError;
    const navigate = useNavigate();

    useEffect(() => {
        if (!error) return;

        console.error("Error caught by ErrorHandler:", error);



        switch(error.status){
            case 401 : {
                clearTokens();
                navigate("/login", { replace: true });
                break;
            };
            case 403 : {
              navigate("/no-access", { replace: true }); 
              break;
            };
            case 404 : {
                navigate("/not-found", { replace: true });
                break;
            };
        }
    }, [error, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-4">An error occurred</h1>
            <p className="text-gray-600 mb-2">{error?.message || "Unexpected error"}</p>
            <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Go Back
            </button>
        </div>
    );
}
