import './home.css';
import { useState, useEffect } from 'react';
import { useModal } from 'react-hooks-use-modal';
import utils from '../../utils/utils';
import axios from 'axios';

export const Home = () => {
  const [model, setModel] = useState();
  const [image, setImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const [Modal, open, close, isOpen] = useModal('root', {
    preventScroll: true,
    closeOnOverlayClick: false,
  });

  const uploadImage = async (data) => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/prediction', data);

      if (res.data.succeeded) {
        utils.successToastMessage('Image Processed Successfully');
        setPredictionResult(res.data.prediction);
        open();
      } else {
        utils.errorToastMessage(res.data.message);
      }
    } catch (error) {
      if (error.response.data)
        utils.errorToastMessage('Sorry error in Image Processing');
      else {
        utils.errorToastMessage(error.message);
      }
    }
  };

  const handleClick = () => {
    document.getElementById('image-upload').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('image', image);
    data.append('model', model);
    uploadImage(data);
  };
  return (
    <>
      <div className='page-body'>
        <h1 className='heading'> Wheat Rust Disease Detection</h1>
        <div className='page-flex-container'>
          <form onSubmit={handleSubmit}>
            <div className='inputfile flexCenter'>
              <div className='inputfile flexCenter'>
                <div
                  className='image-div'
                  style={{
                    width: '300px',
                    height: '300px',
                    backgroundColor: '#f5d0d0',
                    cursor: 'pointer',
                  }}
                  onClick={handleClick}
                >
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt='uploaded image'
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <p
                      className='para'
                      style={{ textAlign: 'center', lineHeight: '300px' }}
                    >
                      Click to upload image
                    </p>
                  )}
                </div>
                <input
                  type='file'
                  accept='image/*'
                  id='image-upload'
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                  }}
                  style={{ display: 'none' }}
                />
              </div>
              <div className='select'>
                <select
                  className='select-heading'
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option>Please Select a Model</option>

                  <option
                    key={1234}
                    value={'disease'}
                  >
                    Disease
                  </option>
                </select>
              </div>
              <button className='post-button'>Start process</button>
            </div>
          </form>
        </div>
      </div>
      <Modal>
        <div className='modal'>
          <h1>Result</h1>
          {predictionResult ? (
            <>
              <p
                className='p1'
                id='title'
              >
                Prediction Class:
              </p>
              <p className='p1'> {predictionResult.class}</p>
              <br />
              <p
                className='p2'
                id='title'
              >
                Prediction Probability:
              </p>
              <p className='p2'>
                {' '}
                {Math.floor(predictionResult.probability * 100)}
              </p>
              <br />
            </>
          ) : (
            <p>Loading prediction result...</p>
          )}
          <button onClick={close}>CLOSE</button>
        </div>
      </Modal>
    </>
  );
};
