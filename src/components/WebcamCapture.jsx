import Webcam from 'react-webcam'

function WebcamCapture() {
  return (
    <Webcam
      mirrored={true}
      className="w-full h-full object-cover rounded-lg"
    />
  )
}

export default WebcamCapture
