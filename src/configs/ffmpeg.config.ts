import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";


ffmpeg.setFfmpegPath(ffmpegStatic as string);

export default ffmpeg;
