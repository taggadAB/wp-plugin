import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TaggadGallery from '../components/TaggadGallery'

export default class Shortcode extends Component {
  render() {
    return (
      <div className="taggad-shortcode-wrapper">
      	<TaggadGallery n={4}/>
      </div>
    );
  }
}

Shortcode.propTypes = {
  wpObject: PropTypes.object
};