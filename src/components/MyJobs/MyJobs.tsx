const { selectedJob, setCurrentScreen } = useApp();

if (!selectedJob) return <EmptyState />;

return (
  <>
    <JobHeaderCard job={selectedJob} />
    <button onClick={() => setCurrentScreen('cutting-job-detail')}>
      Continue Working
    </button>
  </>
);
