import React from 'react';
import { Grid, Typography, Divider } from '@mui/material';

const FormSection = ({ title, children, showDivider = true }) => {
  return (
    <>
      {title && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom className="section-title">
            {title}
          </Typography>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {children}
        </Grid>
      </Grid>
      
      {showDivider && (
        <Grid item xs={12}>
          <Divider />
        </Grid>
      )}
    </>
  );
};

export default FormSection;
