"use client";

 

type ReusableModalProps = {
  isOpen: boolean;
  message: string;
  id?: string; 
  onConfirm: (id?: string) => void;
  onCancel: () => void;
};

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  message,
  id,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p_o_wrapper" onClick={onCancel}>
      <div className="p_o_inner" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="b_w_outer">
          <button className="l_c_but" onClick={() => onConfirm(id)}>
            Confirm
          </button>
          <button className="r_c_but" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;
