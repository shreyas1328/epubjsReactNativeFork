import * as React from 'react';

import {View, SafeAreaView, useWindowDimensions, Text} from 'react-native';
import {Reader, ReaderProvider} from './src';
import {useFileSystem} from '@epubjs-react-native/file-system'; // for Bare React Native project

export default function App() {
  const {width, height} = useWindowDimensions();
  console.log("testing", process.env.REACT_APP_EPUB);
  return (
    <SafeAreaView style={{flex: 1}}>
      <ReaderProvider>
        <Reader
          src="https://s3.amazonaws.com/moby-dick/OPS/package.opf"
          width={width}
          height={height}
          fileSystem={useFileSystem}
          onSelected={(cfi) => console.log(cfi)}
        />
      </ReaderProvider>
    </SafeAreaView>
  );
}
