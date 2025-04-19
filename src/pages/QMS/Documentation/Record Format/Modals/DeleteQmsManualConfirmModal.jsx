import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../../../ThemeContext";
import deleteIllustrate from "../../../../../assets/images/Modal/deleteillustration.svg"

const DeleteQmsManualConfirmModal = ({ showDeleteModal, onConfirm, onCancel }) => {
    const { theme } = useTheme();

    return (
        <AnimatePresence>
            {showDeleteModal && (
                <motion.div
                    className="modal-overlays"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={`modals ${theme === "dark" ? "dark" : "light"
                            }`}
                        style={{ maxWidth: 'calc(100vw - 40px)' }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className={`modal-contents space-y-6 ${theme === "dark" ? "dark" : "light"
                                }`}
                        >
                            <div className="flex justify-center">
                                <img src={deleteIllustrate} alt="Delete" className="w-[267px] h-[163px]" />
                            </div>
                            <h3 className="confirmations">
                                Are you sure you want to delete
                                <br />
                                this Record Format?
                            </h3>
                            <div className="modal-actionss gap-3"
                                style={{ maxWidth: 'calc(100vw - 80px)' }}
                            >
                                <button onClick={onCancel} className="btn-cancels duration-200 w-[176px] h-[49px]">
                                    Cancel
                                </button>
                                <button onClick={onConfirm} className="btn-confirms duration-200 w-[176px] h-[49px]">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DeleteQmsManualConfirmModal
