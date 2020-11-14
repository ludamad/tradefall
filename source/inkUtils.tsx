import React from 'react';
import TextInput from 'ink-text-input';

interface InputProps {
	onSubmit(text: string): void;
}
export function Input(props: InputProps) {
	const [query, setQuery] = React.useState('');
	return <TextInput showCursor={true} value={query} onChange={setQuery} onSubmit={props.onSubmit} />;
}
