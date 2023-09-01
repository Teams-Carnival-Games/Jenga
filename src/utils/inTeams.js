export function inTeams() {
    const currentUrl = window.location.href;
    console.log("Current URL:", currentUrl);

    // Extract the base URL and hash fragment
    const [baseUrl, hashFragment] = currentUrl.split("#/");

    // Construct the processed URL
    const processedUrl = hashFragment 
        ? `${baseUrl}/${hashFragment}` 
        : currentUrl;

    const url = new URL(processedUrl);
    const params = url.searchParams;

    console.log("Processed URL:", url.toString());
    return !!params.get("inTeams");
}
