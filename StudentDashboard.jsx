import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import TimetableVisualization from './TimetableVisualization';
import Header from '../../components/Header';
import axiosInstance from '../../axiosInstance';
import { useAuth } from '../../context/AuthContext';

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '20px',
}));

const StyledTabs = styled(Tabs)({
  backgroundColor: '#333',
  color: 'white',
  padding: '10px',
  marginBottom: '20px',
  '& .MuiTab-root': {
    padding: '5px 10px',
    color: 'white',
  },
  '& .Mui-selected': {
    backgroundColor: '#555',
  },
});

const DashboardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

const Actions = styled(Box)({
  display: 'flex',
  gap: '10px',
});

const StyledButton = styled(Button)(({ variant }) => ({
  padding: '8px 15px',
  borderRadius: '4px',
  ...(variant === 'primary' && {
    backgroundColor: '#4CAF50',
    color: 'white',
    '&:hover': {
      backgroundColor: '#3e8e41',
    },
  }),
  ...(variant === 'secondary' && {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    color: '#333',
  }),
}));

const StyledCard = styled(Card)({
  backgroundColor: 'white',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
});

const StyledTableContainer = styled(TableContainer)({
  marginTop: '20px',
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '12px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableHeadCell = styled(StyledTableCell)({
  backgroundColor: '#2196F3',
  color: 'white',
  padding: '12px',
});

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [timetables, setTimetables] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, token } = useAuth();

  const notifications = [
    'New timetable published for your year',
    'Room change for CS101 on Monday',
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!currentUser || !token || currentUser.role !== 'student') return;

      console.log('currentUser:', currentUser);

      if (!currentUser.year_of_study) {
        setError('Year of study not set. Please update your profile.');
        return;
      }

      try {
        setIsLoading(true);
        const timetableRes = await axiosInstance.get('/timetables/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { skip: 0, limit: 100, year: currentUser.year_of_study },
        });

        console.log('Timetable API response:', timetableRes.data);

        const filteredTimetable = timetableRes.data.filter(
          (item) => String(item.year) === String(currentUser.year_of_study)
        );

        console.log('Filtered timetable:', filteredTimetable);

        const formattedTimetables = filteredTimetable.map((item) => ({
          id: item.timeslot_id,
          day: item.day_of_the_week,
          startTime: item.start_time,
          endTime: item.end_time,
          course: item.course_name || `Course-${item.course_id}`,
          room: item.room_name || `Room-${item.room_id}`,
          lecturer: item.lecturer_name || `Lecturer-${item.lecturer_id}`,
          courseType: item.course_name?.toLowerCase().includes('lab') ? 'lab' : 'lecture',
          class: item.year ? `Year ${item.year}` : 'N/A',
          year: item.year,
          semester: item.semester || 'N/A',
        }));

        setTimetables(formattedTimetables);

        setMyTimetable(
          filteredTimetable.map((item) => ({
            course: item.course_name || `Course-${item.course_id}`,
            room: item.room_name || `Room-${item.room_id}`,
            day: item.day_of_the_week,
            time: `${item.start_time}-${item.end_time}`,
            semester: item.semester || 'N/A',
          }))
        );
      } catch (error) {
        console.error('Error fetching timetable:', error);
        setError('Failed to load timetable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [currentUser, token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Header notifications={notifications} />
      <MainContainer>
        <Content>
          <StyledTabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Dashboard" />
            <Tab label="Timetable" />
          </StyledTabs>
          {tabValue === 0 && (
            <>
              <DashboardHeader>
                <Typography variant="h5" color="#333">
                  Student Dashboard
                </Typography>
                <Actions>
                  <StyledButton variant="secondary">Export Timetable</StyledButton>
                  <StyledButton variant="primary">View Profile</StyledButton>
                </Actions>
              </DashboardHeader>
              {error && (
                <Typography color="error" sx={{ marginBottom: '20px' }}>
                  {error}
                </Typography>
              )}
              <StyledCard>
                <CardContent>
                  <Typography variant="h6">My Timetable</Typography>
                  {isLoading ? (
                    <Typography>Loading...</Typography>
                  ) : myTimetable.length > 0 ? (
                    <StyledTableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <StyledTableHeadCell>Course</StyledTableHeadCell>
                            <StyledTableHeadCell>Room</StyledTableHeadCell>
                            <StyledTableHeadCell>Day</StyledTableHeadCell>
                            <StyledTableHeadCell>Time</StyledTableHeadCell>
                            <StyledTableHeadCell>Semester</StyledTableHeadCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {myTimetable.map((slot, index) => (
                            <TableRow key={index}>
                              <StyledTableCell>{slot.course}</StyledTableCell>
                              <StyledTableCell>{slot.room}</StyledTableCell>
                              <StyledTableCell>{slot.day}</StyledTableCell>
                              <StyledTableCell>{slot.time}</StyledTableCell>
                              <StyledTableCell>{slot.semester}</StyledTableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </StyledTableContainer>
                  ) : (
                    <Typography>No timetable data available.</Typography>
                  )}
                </CardContent>
              </StyledCard>
            </>
          )}
          {tabValue === 1 && (
            <TimetableVisualization timetables={timetables} role="student" />
          )}
        </Content>
      </MainContainer>
    </Box>
  );
};

export default StudentDashboard;