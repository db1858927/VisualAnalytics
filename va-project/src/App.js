import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ScatterPlot from './ScatterPlot';
import {Map} from './Map';
import BoxPlot from './BoxPlot';
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


  return (

    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
     
    <div className='external_container'>

    <h1> Visual Analytics for Air Quality Index</h1>

    <Box className='Box' sx={{ flexGrow: 1 }}>
    <Grid container spacing={2}>
      <Grid className='Grid' item xs={4}>
        <Item className='Item'> Map

          <Map />
  
          </Item>
      </Grid>
      <Grid className='Grid' item xs={4} >
        <Item className='Item'>BoxPlot

          <BoxPlot />



        </Item>
      </Grid>
      <Grid item xs={4}>
        <Item className='Item'>ScatterPlot

          <ScatterPlot />
        </Item>
      </Grid>
      <Grid item xs={12}>
        <Item className='Item2'>Time-series</Item>
      </Grid>
    </Grid>
  </Box>
  </div>
  
  </ThemeProvider>
  )


}



export default App;
