import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmModal({
  isOpen,
  isLoading = false,
  title = "Confirmar eliminación",
  message,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-message"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-[#FEF2F2] border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#FEE2E2]">
                    <AlertCircle
                      className="w-5 h-5 text-[#DC2626]"
                      aria-hidden="true"
                    />
                  </div>
                  <h2
                    id="delete-modal-title"
                    className="text-[#0F172A] font-semibold"
                  >
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 hover:bg-[#FECACA] rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p
                  id="delete-modal-message"
                  className="text-[#475569] text-sm leading-relaxed"
                >
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg text-[#0F172A] hover:bg-[#E2E8F0] transition-colors disabled:opacity-50 font-medium text-sm"
                >
                  {cancelText}
                </button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="px-4 py-2 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                >
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                  )}
                  {!isLoading && <Trash2 className="w-4 h-4" />}
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
