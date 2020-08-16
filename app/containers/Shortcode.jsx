import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Carousels from '../components/Carousel';

export default class Shortcode extends Component {
  render() {
    return (
      <div>
  		<Carousels n={2}/>
      </div>
    );
  }
}

Shortcode.propTypes = {
  wpObject: PropTypes.object
};