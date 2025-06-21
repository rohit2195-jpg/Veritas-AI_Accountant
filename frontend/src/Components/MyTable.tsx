
function MyTable({ data }) {
    if (!data || data.length === 0) {
        return <p>No data to display.</p>;
    }

    // Assuming all objects in 'data' have the same keys for headers
    const headers = Object.keys(data[0]);

    return (
        <table>
            <thead>
            <tr>
                {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {headers.map((header, cellIndex) => (
                        <td key={cellIndex}>{row[header]}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default MyTable;
