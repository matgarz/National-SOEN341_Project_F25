import {Button} from "../components/ui/Button.tsx";
import {useNavigate} from "react-router-dom";
import {motion} from "motion/react";

export default function BackButton() {
    const navigate = useNavigate();

    return (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
                className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-400 hover:to-gray-500 text-black cursor-pointer hover:bg-primary/10"
                onClick={() => navigate(-1)}
                variant="ghost"
                size="lg"
        >
            ←
        </Button>
        </motion.div>
    );
}