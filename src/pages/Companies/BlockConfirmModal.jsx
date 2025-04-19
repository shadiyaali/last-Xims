import React from 'react'
import "./blockconfirmmodal.css"
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../ThemeContext";
import blockillustrate from "../../assets/images/Modal/blockillustrate.svg"

const BlockConfirmModal = ({ showBlockConfirmModal, actionType, onConfirm, onCancel }) => {
  const { theme } = useTheme();

  const modalMessage =
    actionType === "block"
      ? ["Are you sure you want to block", "this company?"]
      : ["Are you sure you want to unblock", "this company?"];


  const confirmButtonLabel = actionType === "block" ? "Block" : "Unblock";
  return (
    <AnimatePresence>
      {showBlockConfirmModal && (
        <motion.div
          className="block-cmy-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`block-cmy-modal ${theme === "dark" ? "dark" : "light"
              }`}
              style={{ maxWidth: 'calc(100vw - 40px)' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`block-cmy-modal-content space-y-6 ${theme === "dark" ? "dark" : "light"
                }`}
            >
              <div className='flex justify-center'>
                <img src={blockillustrate} alt="Block" className='w-[168px] h-[147px]' />
              </div>
              <h3 className="block-cmy-confirmation">
                {modalMessage[0]} <br /> {modalMessage[1]}
              </h3>

              <div className="block-cmy-modal-actions gap-3 "
              style={{ maxWidth: 'calc(100vw - 80px)' }}
              >
                <button onClick={onCancel} className="block-cmy-btn-cancel duration-200  w-[176px] h-[49px]">
                  Cancel
                </button>
                <button onClick={onConfirm} className="block-cmy-btn-confirm duration-200  w-[176px] h-[49px]">
                  {confirmButtonLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlockConfirmModal
