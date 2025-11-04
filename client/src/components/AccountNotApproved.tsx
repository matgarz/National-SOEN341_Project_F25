import {AnimatePresence, motion} from "motion/react";
import BackButton from "../routes/BackButton.tsx";
import {Button} from "./ui/Button.tsx";
import {useNavigate} from "react-router-dom";

interface AccountNotApprovedProps {
    message: string;
    nameOfUser: string;
}

export default function AccountNotApproved({ message, nameOfUser }: AccountNotApprovedProps) {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col items-center justify-center h-screen text-center">

                                <h1 className="text-4xl font-bold mb-4">Hello {nameOfUser},</h1>
                                <p className="text-gray-600 mb-4 whitespace-pre-line">
                                    {message}
                                </p>
                                <p className="text-gray-600 mb-4">
                                    If you have questions on your approval status, please contact administration.
                                </p>
                                <Button
                                    className="bg-gradient-to-r from-gray-200 to-gray-200 hover:from-gray-400 hover:to-gray-500 text-black cursor-pointer hover:bg-primary/10"
                                    onClick={() => navigate('/')}
                                    variant="ghost"
                                    size="lg"
                                >
                                    back
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
        </AnimatePresence>
    );
}
