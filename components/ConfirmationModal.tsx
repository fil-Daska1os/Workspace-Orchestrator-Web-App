
import React from 'react';
import { ConfirmationPayload, EmailPayload, EventPayload, DocPayload } from '../types';

interface ConfirmationModalProps {
  payload: ConfirmationPayload;
  onConfirm: () => void;
  onCancel: () => void;
}

const EmailPreview: React.FC<{ data: EmailPayload }> = ({ data }) => (
  <>
    <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Email</h3>
    <div className="mt-4 space-y-3 text-sm text-gray-600">
      <p><span className="font-semibold text-gray-800">To:</span> {data.to}</p>
      <p><span className="font-semibold text-gray-800">Subject:</span> {data.subject}</p>
      <div className="border-t pt-3 mt-3">
        <p className="whitespace-pre-wrap">{data.body}</p>
      </div>
    </div>
  </>
);

const EventPreview: React.FC<{ data: EventPayload }> = ({ data }) => (
  <>
    <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Calendar Event</h3>
    <div className="mt-4 space-y-3 text-sm text-gray-600">
      <p><span className="font-semibold text-gray-800">Title:</span> {data.title}</p>
      <p><span className="font-semibold text-gray-800">Date:</span> {data.date}</p>
      <p><span className="font-semibold text-gray-800">Time:</span> {data.time}</p>
      {data.attendees && data.attendees.length > 0 && (
        <p><span className="font-semibold text-gray-800">Attendees:</span> {data.attendees.join(', ')}</p>
      )}
    </div>
  </>
);

const DocPreview: React.FC<{ data: DocPayload }> = ({ data }) => (
  <>
    <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Google Doc Creation</h3>
    <div className="mt-4 space-y-3 text-sm text-gray-600">
      <p><span className="font-semibold text-gray-800">Title:</span> {data.title}</p>
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-gray-800">Initial Content:</p>
        <p className="whitespace-pre-wrap mt-1">{data.content || '(No initial content)'}</p>
      </div>
    </div>
  </>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ payload, onConfirm, onCancel }) => {
  const renderContent = () => {
    switch (payload.toolName) {
      case 'send_email':
        return <EmailPreview data={payload.toolArgs as EmailPayload} />;
      case 'create_calendar_event':
        return <EventPreview data={payload.toolArgs as EventPayload} />;
      case 'create_google_doc':
        return <DocPreview data={payload.toolArgs as DocPayload} />;
      default:
        return <p>Unknown action.</p>;
    }
  };

  const confirmText = {
      'send_email': 'Send Email',
      'create_calendar_event': 'Create Event',
      'create_google_doc': 'Create Document'
  }[payload.toolName]

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10" aria-hidden="true">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
          <div>
            {renderContent()}
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
