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
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { grey } from '@mui/material/colors';


const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 118,
      
    },
  },
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(grey[50]),
  backgroundColor: grey[50],
  '&:hover': {
    backgroundColor: grey[50],
  },
  marginTop: 'auto'
}));


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});




function App() {

  const [selectedRegion, setSelectedRegion] = useState(null);
    const [allData, setAllData] = useState([]);
    const [pollutant, setPollutant] = React.useState('_pm10');
    const [years, setYears] = React.useState('2010');

  const handleChangeYears = (event) => {
    setYears(event.target.value);
  };


  const handleChange = (event) => {
    setPollutant(event.target.value);
  };


    useEffect(() => {
      const loadData = async () => {
        try {
            const csvData = await d3.csv(`./years${pollutant}/dati_${years}.csv`);
            setAllData(csvData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };
    loadData();
        
    }, [pollutant,years]);

    const handleReset = () => {
      
      
      setSelectedRegion(null)
      
    };

  return (
    <div className='external_container'>

    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

    <Box className='Box' sx={{ flexGrow: 5 }}>
    <Grid container spacing={0.8} sx={{ padding: '10px' }}>
    <Grid  item xs={2.3} > <Item className='Item'>
      
      <h2 style={{ marginBottom: '1px'}}>Air Quality Index </h2>
      
      Select a pollutant:<br></br>
      <FormControl sx={{ m: 2, minWidth: 100, marginTop: '10px'}}>
      <InputLabel id="demo-simple-select-autowidth-label">Pollutant</InputLabel>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-autowidth-label"
            
            value={pollutant}
            label="Pollutant"
            onChange={handleChange}
          >
            <MenuItem value={'_pm10'}>PM10</MenuItem>
            <MenuItem value={'_pm25'}>PM2.5</MenuItem>
            <MenuItem value={'_no2'}>NO2</MenuItem>
            <MenuItem value={'_o3'}>O3</MenuItem>
            <MenuItem value={'_total'}>Total</MenuItem>
          </Select>
          </FormControl><br></br>
          Select an year:<br></br>
      <FormControl sx={{ m: 2, minWidth: 100, marginTop: '10px'}}>
      <InputLabel id="demo-simple-select-autowidth-label">Year</InputLabel>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-autowidth-label"
            
            value={years}
            label="Year"
            onChange={handleChangeYears}
            MenuProps={MenuProps}
          >
            <MenuItem value={'2010'}>2010</MenuItem>
            <MenuItem value={'2011'}>2011</MenuItem>
            <MenuItem value={'2012'}>2012</MenuItem>
            <MenuItem value={'2013'}>2013</MenuItem>
            <MenuItem value={'2014'}>2014</MenuItem>
            <MenuItem value={'2015'}>2015</MenuItem>
            <MenuItem value={'2016'}>2016</MenuItem>
            <MenuItem value={'2017'}>2017</MenuItem>
            <MenuItem value={'2018'}>2018</MenuItem>
            <MenuItem value={'2019'}>2019</MenuItem>
            <MenuItem value={'2020'}>2020</MenuItem>
            <MenuItem value={'2021'}>2021</MenuItem>
            <MenuItem value={'2022'}>2022</MenuItem>
          </Select>
          </FormControl>
          
          <div style= {{minHeight: '30px', marginTop: '-10px'}}>
          
          {selectedRegion && <p>Selected Region:<br></br> <b>{selectedRegion}</b></p> }
          
          </div>
         
          
  
  
          
          <ColorButton className='reset' variant="contained" onClick={handleReset}>Reset</ColorButton>
          
          </Item> </Grid>
      <Grid  item xs={4}>
        <Item className='Item'> 
          Map
          
          <Map selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} pollutant={pollutant} year = {years} />
          
  
          </Item>
      </Grid>
      <Grid  item xs={5.7} >
        <Item className='Item'>BoxPlot

        <BoxPlot selectedRegion={selectedRegion} allData={allData} setSelectedRegion={setSelectedRegion} pollutant={pollutant} year = {years}/>



        </Item>
      </Grid>
      
      <Grid item xs={7}>
        <Item className='Item'>Time-series
        <LineChart selectedRegion={selectedRegion} pollutant={pollutant} setYears={setYears}  />
        </Item>
      </Grid>
      <Grid item xs={5}>
        <Item className='Item'>ScatterPlot

          <ScatterPlot year = {years} />
        </Item>
      </Grid>
      
    </Grid>
  </Box>
 
  
  </ThemeProvider>
  </div>
  )


}



export default App;
