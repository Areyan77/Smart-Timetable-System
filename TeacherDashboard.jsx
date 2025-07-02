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
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
});

const StyledTableContainer = styled(TableContainer)({
  marginTop: '20px',
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '12px',
  border: '1px solid #e0e0e0',
}));

const StyledTableHeadCell = styled(StyledTableCell)({
  backgroundColor: '#2196F3',
  color: 'white',
  padding: '12px',
});

const TeacherDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [timetables, setTimetablesByTime] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, token } = useAuth();

  const notifications = [
    'New timetable assigned for CS101',
    'Room change for ENG202 on Wednesday',
  ];

  // Function to strip titles from lecturer names
  const stripTitles = (name) => {
    if (!name) return '';
    const titles = [
      'Dr\\.?',
      'Professor',
      'Assoc\\.? Prof\\.?',
      'Associate Professor',
      'Mr\\.?',
      'Ms\\.?',
      'Mrs\\.?',
    ];
    const regex = new RegExp(`^(${titles.join('|')})\\s+`, 'i');
    return name.replace(regex, '').trim();
  };

  useEffect(() => {
    const fetchTimetableData = async () => {
      if (!currentUser || !token || currentUser.role !== 'lecturer') return;

      try {
        setIsLoading(true);
        const timetableDataRes = await axiosInstance.get('/timetables/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { skip: 0, limit: '100' },
        });

        const lecturerName = `${currentUser.first_name} ${currentUser.last_name}`.toLowerCase();
        const filteredTimetableData = timetableDataRes.data.filter(
          (item) => {
            if (!item.lecturer_name) return false;
            const normalizedLecturerName = stripTitles(item.lecturer_name).toLowerCase();
            return normalizedLecturerName.includes(lecturerName);
          }
        );

        const formattedTimetable = filteredTimetableData.map((item) => ({
          id: item.timeslot_id,
          day: item.day_of_the_week,
          startTime: item.start_time,
          endTime: item.end_time,
          course: item.course_name || `Course-${item.course_id}`,
          room: item.room_name || `Room-${item.room_id}`,
          lecturer: item.lecturer_name || `Lecturer-${item.lecturer_id}`,
          courseType: item.course_name?.toLowerCase().includes('lab') ? 'lab' : 'lecture',
          class: item.year ? `Year ${item.year}` : 'N/A',
          year: item.year || 'N/A',
          semester: item.semester || 'N/A',
        }));

        setTimetablesByTime(formattedTimetable);

        setMyTimetable(
          filteredTimetableData.map((item) => ({
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

    fetchTimetableData();
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
                  Teacher Dashboard
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
            <TimetableVisualization timetables={timetables} role="teacher" />
          )}
        </Content>
      </MainContainer>
    </Box>
  );
};

export default TeacherDashboard;
