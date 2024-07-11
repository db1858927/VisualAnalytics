import './App.css';
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ScatterPlot from './ScatterPlot';
import Map from './Map';
import BoxPlot from './BoxPlot';
import LineChart from './Time-series';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



function App() {

  const [selectedRegion, setSelectedRegion] = useState(null);
    const [allData, setAllData] = useState([]);

    useEffect(() => {
      const loadData = async () => {
        try {
            const csvData = await d3.csv("./years_no2/dati_2002.csv");
            setAllData(csvData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };
    loadData();
        
    }, []);

    const handleReset = () => {
      
      
      setSelectedRegion(null)
      
    };

  return (

    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
     
    <div className='external_container'>

    <h1> Visual Analytics for Air Quality Index</h1>
    <Button variant="outlined" onClick={handleReset}>Reset</Button>

    <Box className='Box' sx={{ flexGrow: 1 }}>
    <Grid container spacing={2}>
      <Grid  item xs={6}>
        <Item className='Item'> 
          Map
          <center>
          <Map selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
          </center>
  
          </Item>
      </Grid>
      <Grid  item xs={6} >
        <Item className='Item'>BoxPlot

        <BoxPlot selectedRegion={selectedRegion} allData={allData} setSelectedRegion={setSelectedRegion}/>



        </Item>
      </Grid>
      <Grid item xs={7}>
        <Item className='Item2'>Time-series
        <LineChart selectedRegion={selectedRegion} />
        </Item>
      </Grid>
      <Grid item xs={5}>
        <Item className='Item2'>ScatterPlot

          <ScatterPlot />
        </Item>
      </Grid>
      
    </Grid>
  </Box>
  </div>
  
  </ThemeProvider>
  )


}



export default App;
