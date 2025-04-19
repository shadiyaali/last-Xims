import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import success from "../../../../../assets/images/Modal/successIllustration.svg";
import successdark from "../../../../../assets/images/Modal/successIllustrationdark.svg";
import { useTheme } from '../../../../../ThemeContext';
import { X } from "lucide-react";

const PublishSuccessModal = ({ showPublishSuccessModal, onClose }) => {
    const { theme } = useTheme();

    if (!showPublishSuccessModal) return null;
    return (
        <AnimatePresence>
            {showPublishSuccessModal && (
                <motion.div
                    className="success-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={`success-modal ${theme === "dark" ? "dark" : "light"}`}
                        style={{ maxWidth: 'calc(100vw - 40px)' }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className='flex justify-end'>
                            <button onClick={onClose} className="bg-[#eeeeee] rounded-md w-[36px] h-[36px] flex justify-center items-center modal-close-icon">
                                <X className='w-[24px] h-[24px] text-[#1C1C24] close-img' />
                            </button>
                        </div>
                        <div className={`success-modal-content flex flex-col items-center justify-center ${theme === "dark" ? "dark" : "light"}`}>
                            <img src={success} alt="" className="w-[144px] h-[144px] success-light" />
                            <img src={successdark} alt="" className="w-[144px] h-[144px] success-dark" />
                            <h1 className="success-messegehead">Success!!</h1>
                            <p className="success-messege">Evaluation Compliance Published Successfully</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PublishSuccessModal
