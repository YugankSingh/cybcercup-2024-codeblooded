import React from 'react';
import "../scss/Modal.scss"
function Modal({ handleClose, handleProceed, handleCancel, heading, text, CustomElement, CustomElementProps }) {
	return (
		<div id="modal">
			<div id="backdrop" onClick={handleClose}></div>
			<div id="content">
				{heading && <h2>{heading}</h2>}
				<p>{text}</p>
				{CustomElement && <CustomElement {...CustomElementProps} />}
				<div id="buttons">
					<button onClick={handleCancel} id="cancel">
						Cancel
					</button>
					<button onClick={handleProceed} id="confirm">
						Proceed
					</button>
				</div>
			</div>
		</div>
	)
}

export default Modal

