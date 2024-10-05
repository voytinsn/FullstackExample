interface ConfirmModalProps {
  headerText: string;
  questionText: string;
  onConfirm: () => void;
}

export default function ButtonConfirmDelete(props: ConfirmModalProps) {
  const modalId = "confirmDeleteModal" + Math.random().toString(16).slice(2);

  const onSubmit = async () => {
    props.onConfirm();
  };

  return (
    <>
      <div className="modal fade" id={modalId} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">{props.headerText}</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{props.questionText}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Нет
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={onSubmit}
              >
                Да
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        className="btn btn-sm btn-outline-danger"
        data-bs-toggle="modal"
        data-bs-target={"#" + modalId}
      >
        <i className="bi bi-trash"></i>
      </button>
    </>
  );
}
